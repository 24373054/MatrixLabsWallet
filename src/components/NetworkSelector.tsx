import React, { useState } from 'react';
import { Card } from './Card';
import { Check, ChevronDown } from 'lucide-react';
import { useWalletStore } from '../store/wallet';
import { StorageService } from '../lib/storage';
import type { Network } from '../lib/storage';

interface NetworkSelectorProps {
  onNetworkChange?: (network: Network) => void;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({ onNetworkChange }) => {
  const { currentNetwork, networks, setCurrentNetwork } = useWalletStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectNetwork = async (network: Network) => {
    setCurrentNetwork(network);
    // Save to storage
    await StorageService.set('currentNetwork', network.id);
    onNetworkChange?.(network);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 glass glass-border rounded-lg hover:bg-matrix-surface/80 transition-smooth"
      >
        <div className="w-2 h-2 bg-matrix-accent-secondary rounded-full" />
        <span className="text-sm text-matrix-text-primary">{currentNetwork?.name}</span>
        <ChevronDown
          size={16}
          className={`text-matrix-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 z-50">
            <Card className="overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => handleSelectNetwork(network)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-matrix-surface/50 transition-smooth text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          network.id === currentNetwork?.id
                            ? 'bg-matrix-accent-secondary'
                            : 'bg-matrix-text-muted/30'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-matrix-text-primary">
                          {network.name}
                        </p>
                        <p className="text-xs text-matrix-text-muted">
                          {network.symbol}
                        </p>
                      </div>
                    </div>
                    {network.id === currentNetwork?.id && (
                      <Check size={16} className="text-matrix-accent-secondary" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
