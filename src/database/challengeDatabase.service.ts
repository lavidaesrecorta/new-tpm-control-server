import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PendingChallenge } from './challenge.entity';

@Injectable()
export class ChallengeDatabaseService {
  constructor(
    @InjectRepository(PendingChallenge)
    private entityRepository: Repository<PendingChallenge>
  ) { } 

  async findAll(): Promise<PendingChallenge[]> {
    return await this.entityRepository.find();
  }

  async findOne(token: string) {
    return await this.entityRepository.findOne({where: {token_uid: token}})
  }

  async create(entity: PendingChallenge): Promise<PendingChallenge> {
    return await this.entityRepository.save(entity);
  }

  async update(entity: PendingChallenge): Promise<UpdateResult> {
    return await this.entityRepository.update(entity.id, entity)
  }

  async delete(id): Promise<DeleteResult> {
    return await this.entityRepository.delete(id);
  }
  async deleteAll() {
    return await this.entityRepository.clear();
  }
}
