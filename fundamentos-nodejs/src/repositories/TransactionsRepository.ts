import Transaction from '../models/Transaction';

interface CreateTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}
interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const income = this.transactions.reduce(
      (prevTransactionsIncome, currentTransactions) => {
        if (currentTransactions.type === 'income') {
          return prevTransactionsIncome + currentTransactions.value;
        }
        return prevTransactionsIncome;
      },
      0,
    );

    const outcome = this.transactions.reduce(
      (prevTransactionsIncome, currentTransactions) => {
        if (currentTransactions.type === 'outcome') {
          return prevTransactionsIncome + currentTransactions.value;
        }
        return prevTransactionsIncome;
      },
      0,
    );

    const total = income - outcome;

    return { income, outcome, total };
  }

  public create({ title, value, type }: CreateTransaction): Transaction {
    const transaction = new Transaction({ title, value, type });

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
