/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'payload',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    const bucket = new sst.aws.Bucket('MediaBucket', {
      public: true,
    })
    new sst.aws.Nextjs('MyWeb', {
      link: [bucket],
    })
  },
})
