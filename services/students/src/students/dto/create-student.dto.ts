import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { StudentStatus } from '@ghss/database';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth!: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @IsUUID()
  @IsNotEmpty()
  admissionAcademicYearId!: string;
}
