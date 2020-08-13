import { getRepository, Repository, In } from 'typeorm';
import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsList = await this.ormRepository.findByIds(products);

    return productsList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const currentProducts = await this.findAllById(products);
    const newProducts: Product[] = [];

    products.forEach((product: IUpdateProductsQuantityDTO) => {
      const matchProduct = currentProducts.find(
        currentProduct => currentProduct.id === product.id,
      );

      if (!matchProduct) {
        return;
      }

      matchProduct.quantity -= product.quantity;

      if (matchProduct.quantity < 0) {
        throw new AppError('Insuficient quantities');
      }

      newProducts.push(matchProduct);
    });

    return this.ormRepository.save(newProducts);
  }
}

export default ProductsRepository;
