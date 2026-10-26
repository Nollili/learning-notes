import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'textbook_accounts' })
export class Account {
  @PrimaryKey({ type: 'uuid' }) id: string = randomUUID();
  @Property({ unique: true }) email!: string;
  @Property({ fieldName: 'password_hash' }) passwordHash!: string;
  @Property({ fieldName: 'credential_version' }) credentialVersion = 1;
}

@Entity({ tableName: 'textbook_tasks' })
export class Task {
  @PrimaryKey({ type: 'uuid' }) id: string = randomUUID();
  @Property({ type: 'uuid', fieldName: 'owner_id' }) ownerId!: string;
  @Property() title!: string;
  @Property() done = false;
}
