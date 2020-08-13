import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const income = transactions.reduce(
      (prevTransactionsIncome, currentTransactions) => {
        if (currentTransactions.type === 'income') {
          return +prevTransactionsIncome + +currentTransactions.value;
        }
        return prevTransactionsIncome;
      },
      0,
    );

    const outcome = transactions.reduce(
      (prevTransactionsIncome, currentTransactions) => {
        if (currentTransactions.type === 'outcome') {
          return +prevTransactionsIncome + +currentTransactions.value;
        }
        return prevTransactionsIncome;
      },
      0,
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
