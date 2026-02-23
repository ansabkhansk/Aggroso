import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Snapshot } from './Snapshot';
import { Change } from './Change';

export type CompetitorType = 'pricing' | 'docs' | 'changelog' | 'other';

@Entity('competitors')
export class Competitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'other',
  })
  type: CompetitorType;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: 'pending' | 'success' | 'error';

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Snapshot, (snapshot) => snapshot.competitor)
  snapshots: Snapshot[];

  @OneToMany(() => Change, (change) => change.competitor)
  changes: Change[];
}
