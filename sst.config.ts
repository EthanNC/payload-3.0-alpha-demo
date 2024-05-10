/// <reference path="./.sst/platform/config.d.ts" />
import * as mongodbatlas from '@pulumi/mongodbatlas'

export default $config({
  app(input) {
    return {
      name: 'payload',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      region: 'us-east-1',
      providers: {
        random: true,
      },
    }
  },
  async run() {
    $linkable(mongodbatlas.Cluster, function () {
      return {
        properties: {
          name: this.name,
          host: this.connectionStrings[0].standardSrv.apply((s) => s.split('.')[1]),
        },
      }
    })
    $linkable(mongodbatlas.DatabaseUser, function () {
      return {
        properties: {
          username: this.username,
          password: this.password,
        },
      }
    })

    const bucket = new sst.aws.Bucket('MediaBucket', {
      public: true,
    })

    const project = new mongodbatlas.Project('PayloadDb', {
      orgId: '5d3cc2faf2a30bfd467db6e0',
    })

    new mongodbatlas.ProjectIpAccessList('PublicIpAccess', {
      projectId: project.id,
      cidrBlock: '0.0.0.0/0',
      comment: 'allow all traffic',
    })

    // const process.env.NODE_ENV = 'development'
    // const database = new mongodbatlas.ServerlessInstance('DevInstance', {
    //   projectId: project.id,
    //   providerSettingsBackingProviderName: 'AWS',
    //   providerSettingsProviderName: 'SERVERLESS',
    //   providerSettingsRegionName: 'US_EAST_1',
    // })

    // database.connectionStringsStandardSrv
    // cluster.providerRegionName

    const cluster = new mongodbatlas.Cluster(`ClusterProd`, {
      backingProviderName: 'AWS',
      projectId: project.id,
      providerInstanceSizeName: 'M0',
      providerName: 'TENANT',
      providerRegionName: 'US_EAST_1',
    })

    const user = new mongodbatlas.DatabaseUser('DatabaseUser', {
      authDatabaseName: 'admin',
      username: $interpolate`${$app.name}-${$app.stage}`,
      password: new random.RandomString('DatabasePassword', {
        length: 16,
        special: false,
      }).result,
      projectId: project.id,
      roles: [
        {
          roleName: 'readWrite',
          databaseName: 'payload-dev',
        },
      ],
      scopes: [
        {
          name: cluster.name,
          type: 'CLUSTER',
        },
      ],
    })
    // const connectionString = pulumi
    //   .all([cluster.name, dbUser.username, dbUser.password])
    //   .apply(([clusterName, username, password]) => {
    //     return `mongodb+srv://${username}:${password}@${clusterName}.xmhevmw.mongodb.net/payload-dev?retryWrites=true`
    //   })

    new sst.aws.Nextjs('MyWeb', {
      // buildCommand: 'OPEN_NEXT_DEBUG=true npx --yes open-next@3.0.0-rc.12 build',
      link: [bucket, cluster, user],
      // environment: {
      //   MONGODB_URI: connectionString,
      // },
      // transform: {
      //   server: (args) => {
      //     args.vpc = {
      //     }
      //   },
      // },
    })
  },
})
