import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(
    owner: User,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const items = createWishlistDto.itemsId.map((id) => ({ id }));

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      owner: owner,
      items: items as Wish[],
    });

    return this.wishlistRepository.save(wishlist);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });
  }

  async findOne(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException('Подборка не найдена');
    }
    return wishlist;
  }

  async updateOne(
    id: number,
    userId: number,
    updateWishlistDto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете редактировать чужие подборки');
    }

    if (updateWishlistDto.itemsId) {
      const items = updateWishlistDto.itemsId.map((itemId) => ({ id: itemId }));
      Object.assign(wishlist, updateWishlistDto);
      wishlist.items = items as Wish[];
      return this.wishlistRepository.save(wishlist);
    } else {
      const { itemsId, ...restDto } = updateWishlistDto;
      await this.wishlistRepository.update(id, restDto);
      return this.findOne(id);
    }
  }

  async removeOne(id: number, userId: number) {
    const wishlist = await this.findOne(id);
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужие подборки');
    }
    await this.wishlistRepository.delete(id);
    return wishlist;
  }
}
