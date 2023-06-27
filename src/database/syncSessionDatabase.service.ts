import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SyncSession } from './syncSession.entity';

@Injectable()
export class SessionDatabaseService {
  constructor(
    @InjectRepository(SyncSession)
    private entityRepository: Repository<SyncSession>
  ) { } 

  async findAll(): Promise<SyncSession[]> {
    return await this.entityRepository.find();
  }

  async findOne(token: string) {
    return await this.entityRepository.findOne({where: {token_uid: token}})
  }

  async create(entity: SyncSession): Promise<SyncSession> {
    return await this.entityRepository.save(entity);
  }

  async update(entity: SyncSession): Promise<UpdateResult> {
    return await this.entityRepository.update(entity.id, entity)
  }

  async delete(id): Promise<DeleteResult> {
    return await this.entityRepository.delete(id);
  }
  async deleteAll() {
    return await this.entityRepository.clear();
  }
}
