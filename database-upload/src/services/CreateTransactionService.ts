import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;

  value: number;

  type: 'income' | 'outcome';

  category_title: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type.');
    }

    const transactions = await transactionRepository.find();
    const balance = await transactionRepository.getBalance(transactions);

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(`You don't have enough cash to this transaction.`);
    }

    let category = await categoryRepository.findOne({
      where: { title: category_title },
    });

    if (!category) {
      categoryRepository.create({ title: category_title });
      category = await categoryRepository.save({ title: category_title });
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionRepository.save(transaction);

    return { ...transaction, category };
  }
}

export default CreateTransactionService;
