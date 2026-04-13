import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private dataSource: DataSource,
  ) {}

  async create(user: User, CreateOfferDto: CreateOfferDto): Promise<Offer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wish = await queryRunner.manager.findOne(Wish, {
        where: { id: CreateOfferDto.itemId },
        relations: ['owner'],
      });

      if (!wish) {
        throw new NotFoundException('Подарок не найден');
      }

      if (wish.owner.id === user.id) {
        throw new ForbiddenException(
          'Вы не можете скидываться на свои собственные подарки',
        );
      }

      const newRaised = Number(wish.raised) + CreateOfferDto.amount;
      if (newRaised > wish.price) {
        throw new ForbiddenException(
          'Сумма собранных средств не может превышать стоимость подарка',
        );
      }

      await queryRunner.manager.update(Wish, wish.id, { raised: newRaised });

      const offer = queryRunner.manager.create(Offer, {
        ...CreateOfferDto,
        user: user,
        item: wish,
      });

      const savedOffer = await queryRunner.manager.save(offer);
      await queryRunner.commitTransaction();
      return savedOffer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Offer[]> {
    return this.offersRepository.find({
      relations: ['user', 'item'],
    });
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: { id },
      relations: ['user', 'item'],
    });

    if (!offer) {
      throw new NotFoundException('Заявка не найдена');
    }
    return offer;
  }
}
