import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(owner: User, createWishDto: CreateWishDto) {
    const wish = this.wishRepository.create({ ...createWishDto, owner });
    return await this.wishRepository.save(wish);
  }

  async findLast(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishRepository.find({
      order: {
        copied: 'DESC',
      },
      take: 20,
    });
  }

  async findOne(id: number): Promise<Wish> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  async updateOne(
    wishId: number,
    userId: number,
    UpdateWishDto: UpdateWishDto,
  ) {
    const wish = await this.findOne(wishId);

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие подарки');
    }

    if (UpdateWishDto.price && UpdateWishDto.price > 0) {
      throw new ForbiddenException(
        'Нельзя изменить стоимость: на подарок уже скидываются',
      );
    }
    await this.wishRepository.update(wishId, UpdateWishDto);
    return this.wishRepository.update(wishId, UpdateWishDto);
  }

  async removeOne(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подарки');
    }
    await this.wishRepository.delete(wishId);
    return wish;
  }

  async copy(wishId: number, user: User) {
    const wish = await this.findOne(wishId);
    await this.wishRepository.update(wishId, { copied: wish.copied + 1 });
    const wishCopy = this.wishRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: user,
      raised: 0,
      copied: 0,
    });

    return await this.wishRepository.save(wishCopy);
  }
}
