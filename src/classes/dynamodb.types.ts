export enum AttributeTypesEnum {
    NUMERIC= 'N',
    STRING= 'S'
}
export interface Attribute {
    name: string;
    type: AttributeTypesEnum;
}
