import { Table, Model, Column, DataType, HasOne, BelongsToMany, HasMany, AllowNull, Unique, Default, Index, BelongsTo, ForeignKey, PrimaryKey } from 'sequelize-typescript';
import Sequelize from 'sequelize/types/sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Users } from './Users';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}



export enum UserState {
    STEP_ONE = 'STEP_ONE',
    STEP_TWO = 'STEP_TWO',
    STEP_THREE = 'STEP_THREE',
    VERIFIED = 'VERIFIED',
}



@Table({ timestamps: true, tableName: 'number' })
export class Numbers extends Model {


    @AllowNull(false)
    @Column(DataType.STRING)
    activationCode!: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    phoneNumber!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    status!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    countryName!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    serviceName!: string;


    @AllowNull(true)
    @Column(DataType.STRING)
    code!: string;



    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column(DataType.UUID)
    userId!: string;

}
