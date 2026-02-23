import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Competitor } from './Competitor';

@Entity('snapshots')
export class Snapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  competitorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 64 })
  contentHash: string;

  @Column({ type: 'int', default: 0 })
  contentLength: number;

  @CreateDateColumn()
  fetchedAt: Date;

  @ManyToOne(() => Competitor, (competitor) => competitor.snapshots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'competitorId' })
  competitor: Competitor;
}
