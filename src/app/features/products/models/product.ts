/**
 * Represents the physical size of a product
 */
export interface Dimensions {
    width:number,
    height:number,
    depth:number,
}
/**
 * Represents a single customer review for a product
 */
export interface Reviews{
    rating:number,
    comment:string,
    date:string,
    reviewerName:string,
    reviewerEmail:string,
}
/**
 * Metadata for product tracking and identification
 */
export interface Meta {
    createdAt:string,
    updatedAt:string,
    barcode:string,
    qrCode:string
}
/**
 * Main Product structure based on DummyJSON API response
 */
export interface Product {
    id:number,
    title:string,
    description:string,
    category:string,
    price:number,
    discountPercentage:number,
    rating:number,
    stock:number,
    tags:string[],
    brand:string,
    sku:string,
    weight:number,
    dimensions:Dimensions,
    warrantyInformation:string,
    shippingInformation:string,
    availabilityStatus:string,
    reviews:Reviews[],
    returnPolicy:string,
    minimumOrderQuantity:number,
    meta:Meta,
    images:string[],
    thumbnail:string
}
/**
 * The standard response object for paginated product lists
 */
export interface ProductResponse {
    products:Product[],
    total:number,
    skip:number,
    limit:number
}

export interface ProductFilterCriteria {
  search: string;
  category: string;
  viewMode: 'table' | 'cards'; // ربطنا طريقة العرض بالـ state كمان!
}