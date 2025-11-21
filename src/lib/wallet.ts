import { ethers } from 'ethers';
import { CryptoService } from './crypto';
import { StorageService } from './storage';

export interface Account {
  address: string;
  name: string;
  index: number;
}

export interface VaultData {
  mnemonic: string;
  accounts: Account[];
}

export class WalletService {
  private static currentWallet: ethers.HDNodeWallet | null = null;
  private static vaultData: VaultData | null = null;

  /**
   * Create a new wallet
   */
  static async createWallet(password: string): Promise<string> {
    const mnemonic = CryptoService.generateMnemonic();
    const wallet = await CryptoService.deriveWallet(mnemonic, 0);

    const vaultData: VaultData = {
      mnemonic,
      accounts: [
        {
          address: wallet.address,
          name: 'Account 1',
          index: 0,
        },
      ],
    };

    const encryptedVault = await CryptoService.encrypt(
      JSON.stringify(vaultData),
      password
    );
    const passwordHash = await CryptoService.hashPassword(password);

    await StorageService.setMultiple({
      encryptedVault,
      passwordHash,
    });

    this.currentWallet = wallet;
    this.vaultData = vaultData;

    return mnemonic;
  }

  /**
   * Import wallet from mnemonic
   */
  static async importWallet(mnemonic: string, password: string): Promise<void> {
    if (!CryptoService.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const wallet = await CryptoService.deriveWallet(mnemonic, 0);

    const vaultData: VaultData = {
      mnemonic,
      accounts: [
        {
          address: wallet.address,
          name: 'Account 1',
          index: 0,
        },
      ],
    };

    const encryptedVault = await CryptoService.encrypt(
      JSON.stringify(vaultData),
      password
    );
    const passwordHash = await CryptoService.hashPassword(password);

    await StorageService.setMultiple({
      encryptedVault,
      passwordHash,
    });

    this.currentWallet = wallet;
    this.vaultData = vaultData;
  }

  /**
   * Unlock wallet with password
   */
  static async unlockWallet(password: string): Promise<boolean> {
    try {
      const encryptedVault = await StorageService.get('encryptedVault');
      if (!encryptedVault) {
        throw new Error('No wallet found');
      }

      const decryptedData = await CryptoService.decrypt(encryptedVault, password);
      const vaultData: VaultData = JSON.parse(decryptedData);

      this.vaultData = vaultData;
      this.currentWallet = await CryptoService.deriveWallet(
        vaultData.mnemonic,
        vaultData.accounts[0].index
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Lock wallet
   */
  static lockWallet(): void {
    this.currentWallet = null;
    this.vaultData = null;
  }

  /**
   * Check if wallet is unlocked
   */
  static isUnlocked(): boolean {
    return this.currentWallet !== null;
  }

  /**
   * Get current account
   */
  static getCurrentAccount(): Account | null {
    if (!this.vaultData || this.vaultData.accounts.length === 0) {
      return null;
    }
    return this.vaultData.accounts[0];
  }

  /**
   * Get all accounts
   */
  static getAllAccounts(): Account[] {
    return this.vaultData?.accounts || [];
  }

  /**
   * Add new account
   */
  static async addAccount(password: string, name?: string): Promise<Account> {
    if (!this.vaultData) {
      throw new Error('Wallet not unlocked');
    }

    const newIndex = this.vaultData.accounts.length;
    const wallet = await CryptoService.deriveWallet(this.vaultData.mnemonic, newIndex);

    const newAccount: Account = {
      address: wallet.address,
      name: name || `Account ${newIndex + 1}`,
      index: newIndex,
    };

    this.vaultData.accounts.push(newAccount);

    // Re-encrypt and save vault
    const encryptedVault = await CryptoService.encrypt(
      JSON.stringify(this.vaultData),
      password
    );
    await StorageService.set('encryptedVault', encryptedVault);

    return newAccount;
  }

  /**
   * Switch to account by index
   */
  static async switchAccount(index: number): Promise<void> {
    if (!this.vaultData) {
      throw new Error('Wallet not unlocked');
    }

    const account = this.vaultData.accounts.find((acc) => acc.index === index);
    if (!account) {
      throw new Error('Account not found');
    }

    this.currentWallet = await CryptoService.deriveWallet(
      this.vaultData.mnemonic,
      index
    );
  }

  /**
   * Get current wallet instance
   */
  static getCurrentWallet(): ethers.HDNodeWallet | null {
    return this.currentWallet;
  }

  /**
   * Sign message
   */
  static async signMessage(message: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('Wallet not unlocked');
    }
    return await this.currentWallet.signMessage(message);
  }

  /**
   * Sign transaction
   */
  static async signTransaction(transaction: ethers.TransactionRequest): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('Wallet not unlocked');
    }
    return await this.currentWallet.signTransaction(transaction);
  }

  /**
   * Export private key
   */
  static getPrivateKey(): string {
    if (!this.currentWallet) {
      throw new Error('Wallet not unlocked');
    }
    return this.currentWallet.privateKey;
  }

  /**
   * Get mnemonic phrase
   */
  static getMnemonic(): string | null {
    return this.vaultData?.mnemonic || null;
  }
}
