import {
  Chain,
  Network,
  Wormhole,
  ChainAddress,
} from '@wormhole-foundation/sdk';
import { ethers } from 'ethers';

// Define a basic signer interface that covers our needs
export interface WormholeSigner {
  address: string;
  chain: Chain;
  signTransaction: (transaction: any) => Promise<any>;
  signMessage?: (message: any) => Promise<any>;
}

export class SignerHandler {
  private static instance: SignerHandler;
  private signers: Map<string, WormholeSigner>;

  private constructor() {
    this.signers = new Map();
  }

  public static getInstance(): SignerHandler {
    if (!SignerHandler.instance) {
      SignerHandler.instance = new SignerHandler();
    }
    return SignerHandler.instance;
  }

  public async setSigner(chain: Chain, signer: WormholeSigner): Promise<void> {
    this.signers.set(chain.toString(), signer);
  }

  public async getSigner(chain: Chain): Promise<WormholeSigner> {
    const signer = this.signers.get(chain.toString());
    if (!signer) {
      throw new Error(`No signer found for chain: ${chain.toString()}`);
    }
    return signer;
  }

  public async clearSigner(chain: Chain): Promise<void> {
    this.signers.delete(chain.toString());
  }

  public async clearAllSigners(): Promise<void> {
    this.signers.clear();
  }
}
