import type { Persistable, NativePersistable } from '@core/entities/persistable.entity';
import type { ComplexTypeData } from '@strict-json/domain/entities/complex-type.entity';

export interface ComplexTypeCodecPort {
  /**
   * Returns ComplexTypeData if value is a supported complex type, otherwise null.
   */
  encode(value: Persistable): ComplexTypeData | null;

  /**
   * Returns a complex runtime value if the payload is a ComplexTypeData, otherwise null.
   */
  decode(value: NativePersistable | ComplexTypeData): Persistable | null;
}
