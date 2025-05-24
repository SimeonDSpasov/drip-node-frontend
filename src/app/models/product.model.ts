
export interface ProductImage {
  url: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  link: string;
  images: ProductImage[];
  creatorName: string;
  mainImage: string;
}


export interface ProductInfo {
  title: string;
  titleTrans: string;
  imgList: string[];
  props: Record<string, any>;
  propsTrans: Record<string, any>;
  sales: number;
  productAttr: ProductAttribute[];
  fee: number;
  guarantee: string[];
  deliveryTime: string;
  minNum: number;
  skus: SKU[];
  sellerInfo: SellerInfo;
  price: string;
  imageMapList: any;
  skuPropNamesMap: Record<string, string>;
  skuPropValsMap: Record<string, string>;
}

export interface ProductAttribute {
  attrID: string;
  attr: string;
  attrTrans: string;
  values: AttributeValue[];
}

export interface AttributeValue {
  valueID: string;
  value: string;
  valueTrans: string;
  image: string;
}

export interface SKU {
  skuID: string;
  name: string;
  nameTrans: string;
  imgUrl: string;
  stock: number;
  propsID: string;
  propsCode: number[];
  specId: string;
  price: string;
}

export interface SellerInfo {
  shopLogo: string;
  shopTitle: string;
  shopID: string;
  shopLink: string;
  sellerId: string;
}
