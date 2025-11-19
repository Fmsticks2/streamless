import type { Plan, Subscription, Payment } from '../types';
import { 
  SmartContract, 
  JsonRpcProvider, 
  Args,
  Account
} from '@massalabs/massa-web3';

const CONTRACT_ADDRESS = 'AS12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT';

export class ContractService {
  private provider: JsonRpcProvider | null = null;
  private contract: SmartContract | null = null;
  private contractAddress: string;
  private walletAddress: string = '';

  constructor() {
    this.contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || CONTRACT_ADDRESS;
  }

  async init(): Promise<void> {
    try {
      // Create a dummy account for testnet connection
      const account = await Account.generate();
      this.provider = JsonRpcProvider.buildnet(account);
      
      if (this.contractAddress && this.provider) {
        this.contract = new SmartContract(this.provider, this.contractAddress);
      }
    } catch (error) {
      console.error('Failed to initialize Massa provider:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }
    
    // Connect to Massa wallet (Bearby or similar)
    if (typeof window !== 'undefined' && (window as any).massa) {
      const accounts = await (window as any).massa.request({
        method: 'massa_accounts',
      });
      
      if (accounts && accounts.length > 0) {
        this.walletAddress = accounts[0];
        return this.walletAddress;
      }
    }
    
    throw new Error('No wallet found');
  }

  async listPlans(): Promise<Plan[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await this.contract.read('list_plans', new Args());
      const planIds = result.value as unknown as string[];
      
      const plans: Plan[] = [];
      for (const planId of planIds) {
        const planResult = await this.contract.read('get_plan', new Args().addString(planId));
        const planData = planResult.value as any;
        
        plans.push({
          id: planId,
          creator: planData.creator,
          amount: Number(planData.amount),
          frequencyDays: parseInt(planData.frequencyDays),
          active: planData.active,
        });
      }
      
      return plans;
    } catch (error) {
      console.error('Error listing plans:', error);
      return [];
    }
  }

  async createPlan(planId: string, amount: bigint, frequencyDays: number): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const args = new Args()
        .addString(planId)
        .addU64(amount)
        .addU32(BigInt(frequencyDays));

      await this.contract.call('create_plan', args, {
        coins: 0n,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error creating plan:', error);
      return false;
    }
  }

  async updatePlan(planId: string, amount: bigint, frequencyDays: number, active: boolean): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const args = new Args()
        .addString(planId)
        .addU64(amount)
        .addU32(BigInt(frequencyDays))
        .addBool(active);

      await this.contract.call('update_plan', args, {
        coins: 0n,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      return false;
    }
  }

  async getUserSubscriptions(userAddress: string): Promise<Subscription[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const args = new Args().addString(userAddress);
      const result = await this.contract.read('get_user_subscriptions', args);
      const subscriptions = result.value as unknown as any[];
      
      return subscriptions.map(sub => ({
        subscriber: sub.subscriber,
        planId: sub.planId,
        nextPaymentTime: parseInt(sub.nextPaymentTime),
        active: sub.active,
        remainingCycles: sub.remainingCycles ? parseInt(sub.remainingCycles) : undefined,
      }));
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  async subscribe(planId: string, cycles?: number): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const args = new Args()
        .addString(planId)
        .addBool(cycles !== undefined)
        .addU32(BigInt(cycles || 0));

      await this.contract.call('subscribe', args, {
        coins: 0n,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      return false;
    }
  }

  async cancelSubscription(planId: string): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const args = new Args().addString(planId);
      
      await this.contract.call('cancel_subscription', args, {
        coins: 0n,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return false;
    }
  }

  async getPaymentHistory(userAddress: string): Promise<Payment[]> {
    // Note: This would require implementing event querying or a separate history function
    // For now, return empty array as the contract doesn't store payment history
    console.log('Payment history not yet implemented for:', userAddress);
    return [];
  }

  // Additional methods for deposit/withdraw functionality
  async deposit(amount: bigint): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      await this.contract.call('deposit', new Args(), {
        coins: amount,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error depositing:', error);
      return false;
    }
  }

  async withdraw(amount: bigint): Promise<boolean> {
    if (!this.contract || !this.walletAddress) {
      throw new Error('Contract or wallet not initialized');
    }

    try {
      const args = new Args().addU64(amount);
      
      await this.contract.call('withdraw', args, {
        coins: 0n,
        fee: 100000n,
      });
      
      return true;
    } catch (error) {
      console.error('Error withdrawing:', error);
      return false;
    }
  }

  async getDepositBalance(userAddress: string): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const args = new Args().addString(userAddress);
      const result = await this.contract.read('get_deposit_balance', args);
      return BigInt(result.value as unknown as string);
    } catch (error) {
      console.error('Error getting deposit balance:', error);
      return 0n;
    }
  }
}

export const contractService = new ContractService();