import Example from '@/components/Example'
import Form from '@/components/form'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import Link from 'next/link'
import React from 'react'
import { Resource } from 'sst'

const Page = async () => {
  const command = new PutObjectCommand({
    Key: crypto.randomUUID(),
    Bucket: Resource.MediaBucket.name,
  })
  const url = await getSignedUrl(
    new S3Client({
      region: 'us-east-1',
    }),
    command,
  )

  return (
    <article className={['container'].filter(Boolean).join(' ')}>
      <h1>
        Payload 3.0 <span className="rainbow">ALPHA</span>!
      </h1>
      <p>
        This alpha is rapidly evolving, you can report any bugs against{' '}
        <a href="https://github.com/payloadcms/payload-3.0-alpha-demo/issues" target="_blank">
          the repo
        </a>{' '}
        or in the{' '}
        <a
          href="https://discord.com/channels/967097582721572934/1215659716538273832"
          target="_blank"
        >
          dedicated channel in Discord
        </a>
        .
      </p>

      <p>
        <strong>
          Payload is running at <Link href="/admin">/admin</Link>
        </strong>
      </p>

      <p>
        <Link href="/my-route" target="_blank">
          /my-route
        </Link>{' '}
        contains an example of a custom route running the Local API.
      </p>

      {/* <Example /> */}

      <p>You can use the Local API in your server components like this:</p>
      <pre>
        <code>
          {`import { getPayload } from 'payload'
import configPromise from "@payload-config";
const payload = await getPayload({ config: configPromise })

const data = await payload.find({
  collection: 'posts',
})`}
        </code>
      </pre>

      <Form url={url} />
    </article>
  )
}

export default Page
