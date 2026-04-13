import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Offer } from '../../offers/entities/offer.entity';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'varchar',
    length: 250,
  })
  name: string;

  @Column()
  link: string;

  @Column()
  image: string;

  @Column({
    type: 'numeric',
    scale: 2,
  })
  price: number;

  @Column({
    type: 'numeric',
    scale: 2,
    default: 0,
  })
  raised: number;

  @Column({
    type: 'varchar',
    length: 1024,
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  copied: number;

  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];
}
