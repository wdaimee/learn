import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, PrimaryGeneratedColumn, Entity, Unique, ManyToOne } from 'typeorm';
import { CMBaseEntity } from '../lib/Base.entity';
import { UserWithPassword } from '../User/User.entity';
import { Module } from '../Module/Module.entity';

@ObjectType()
@Entity()
@Unique(['userId', 'moduleId'])
export class UserModule extends CMBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field()
    id: string;

    @Column()
    @Field()
    userId: string;

    @Column()
    @Field()
    moduleId: string;

    @CreateDateColumn()
    completedAt: Date;

    @ManyToOne(() => UserWithPassword)
    user: UserWithPassword;

    @ManyToOne(() => Module)
    module: Module;
}