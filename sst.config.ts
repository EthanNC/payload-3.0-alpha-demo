/// <reference path="./.sst/platform/config.d.ts" />
import * as mongodbatlas from '@pulumi/mongodbatlas'
import * as pulumi from '@pulumi/pulumi'

export default $config({
  app(input) {
    return {
      name: 'payload',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      region: 'us-east-1',
    }
  },
  async run() {
    const bucket = new sst.aws.Bucket('MediaBucket', {
      public: true,
    })

    const project = new mongodbatlas.Project('PayloadDb', {
      orgId: '5d3cc2faf2a30bfd467db6e0',
    })

    project.id
    const clusterName = process.env.SST_LIVE ? 'Dev' : 'Prod'
    const cluster = new mongodbatlas.Cluster(`Cluster${clusterName}`, {
      backingProviderName: 'AWS',
      projectId: project.id,
      providerInstanceSizeName: 'M0',
      providerName: 'TENANT',
      providerRegionName: 'US_EAST_1',
    })

    const dbUser = new mongodbatlas.DatabaseUser('MyDatabaseUser', {
      authDatabaseName: 'admin',
      username: 'myUser',
      password: 'myPassword123',
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
    const connectionString = pulumi
      .all([cluster.name, dbUser.username, dbUser.password])
      .apply(([clusterName, username, password]) => {
        return `mongodb+srv://${username}:${password}@${clusterName}.xmhevmw.mongodb.net/payload-dev?retryWrites=true`
      })

    new sst.aws.Nextjs('MyWeb', {
      buildCommand: 'OPEN_NEXT_DEBUG=true npx --yes open-next@3.0.0-rc.12 build',
      link: [bucket],
      environment: {
        MONGODB_URI: connectionString,
      },
    })
  },
})
