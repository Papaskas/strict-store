import { makeFullName } from '@src/domain/key.format';
import { Persistable } from '@src/domain/entities/persistable';
import { StoreKey } from '@src/domain/entities/store-keys';
import { SerializerPort } from '@src/app/ports/serializer.port';
import { StorageProviderPort } from '@src/app/ports/storage.port';

export class StrictStoreService {
  constructor(
    private readonly storageProvider: StorageProviderPort,
    private readonly serializer: SerializerPort,
  ) {}

  get<T extends Persistable>(key: StoreKey<T>): T | null {
    const storage = this.storageProvider.get(key.storeType);
    const raw = storage.get(makeFullName(key.ns, key.name));

    if (raw === null) return null;
    return this.serializer.parse<T>(raw);
  }

  save<T extends StoreKey<Persistable>>(key: T, value: T["__type"]): void {
    const storage = this.storageProvider.get(key.storeType);
    storage.set(makeFullName(key.ns, key.name), this.serializer.stringify(value));
  }
}
