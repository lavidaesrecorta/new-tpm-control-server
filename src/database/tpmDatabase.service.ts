import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SavedTpm } from './tpm.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class TpmDatabaseService {
  constructor(
    @InjectRepository(SavedTpm)
    private entityRepository: Repository<SavedTpm>
  ) { } 

  async listAllTables(){
    return await this.entityRepository.query('SELECT name FROM sqlite_schema WHERE type="table" ORDER BY name')
  }

  async findAll(): Promise<SavedTpm[]> {
    return await this.entityRepository.find();
  }

  async findOne(token: string) : Promise<SavedTpm> {
    return await this.entityRepository.findOne({where: {token_uid: token}})
  }

  async create(entity: SavedTpm): Promise<SavedTpm> {
    return await this.entityRepository.save(entity);
  }

  async update(entity: SavedTpm): Promise<UpdateResult> {
    return await this.entityRepository.update(entity.id, entity)
  }

  async delete(id): Promise<DeleteResult> {
    return await this.entityRepository.delete(id);
  }

  async deleteAll() {
    return await this.entityRepository.clear();
  }
}
