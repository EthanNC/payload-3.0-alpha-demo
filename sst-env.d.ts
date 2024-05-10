/* tslint:disable *//* eslint-disable */import "sst"
declare module "sst" {
  export interface Resource {
    ClusterProd: {
      host: string
      name: string
      type: "mongodbatlas.index/cluster.Cluster"
    }
    DatabaseUser: {
      password: string
      type: "mongodbatlas.index/databaseUser.DatabaseUser"
      username: string
    }
    MediaBucket: {
      name: string
      type: "sst.aws.Bucket"
    }
  }
}
export {}