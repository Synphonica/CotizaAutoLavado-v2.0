import { PartialType } from '@nestjs/swagger';
import { CreateComparisonDto } from './create-comparison.dto';

export class UpdateComparisonDto extends PartialType(CreateComparisonDto) {}
