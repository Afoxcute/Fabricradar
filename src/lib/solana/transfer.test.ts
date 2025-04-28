import { createSolanaTransfer } from './transfer';

// Simple test transfer
async function testTransfer() {
  try {
    const result = await createSolanaTransfer({
      tokenSymbol: 'SOL',
      amount: '0.01',
      sourceAddress: '4njo25A51RgbnbAkhRpj9UVtdDb3kh9nMHHTKQcYLaLq',
      recipientAddress: '23wRQUTNurqBjnRYpwiSGKaUUAZTzi5so5mmhTgaJbWf',
      signTransaction: async (tx) => {
        // Your signing logic here
        return tx;
      },
    });

    console.log('Transfer result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}
