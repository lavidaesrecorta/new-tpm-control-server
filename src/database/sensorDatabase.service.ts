import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { SensorData } from './sensor_data.entity';
@Injectable()
export class SensorDatabaseService {
  constructor(
    @InjectRepository(SensorData)
    private entityRepository: Repository<SensorData>
  ) { } 

  async findAll(): Promise<SensorData[]> {
    return await this.entityRepository.find();
  }

  async findOne(token: string) {
    return await this.entityRepository.findOne({where: {token_uid: token}})
  }

  async create(entity: SensorData): Promise<SensorData> {
    return await this.entityRepository.save(entity);
  }

  async update(entity: SensorData): Promise<UpdateResult> {
    return await this.entityRepository.update(entity.id, entity)
  }

  async delete(id): Promise<DeleteResult> {
    return await this.entityRepository.delete(id);
  }
  async deleteAll() {
    return await this.entityRepository.clear();
  }
}
