import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Competitor } from './Competitor';
import { Snapshot } from './Snapshot';

export type ChangeSeverity = 'major' | 'minor' | 'cosmetic';

@Entity('changes')
export class Change {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  competitorId: string;

  @Column({ type: 'uuid' })
  previousSnapshotId: string;

  @Column({ type: 'uuid' })
  currentSnapshotId: string;

  @Column({ type: 'text' })
  diff: string;

  @Column({ type: 'text', nullable: true })
  aiSummary: string | null;

  @Column({ type: 'simple-array', nullable: true })
  importantChanges: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'minor',
  })
  severity: ChangeSeverity;

  @Column({ type: 'boolean', default: false })
  isImportant: boolean;

  @CreateDateColumn()
  detectedAt: Date;

  @ManyToOne(() => Competitor, (competitor) => competitor.changes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'competitorId' })
  competitor: Competitor;

  @ManyToOne(() => Snapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'previousSnapshotId' })
  previousSnapshot: Snapshot;

  @ManyToOne(() => Snapshot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'currentSnapshotId' })
  currentSnapshot: Snapshot;
}
