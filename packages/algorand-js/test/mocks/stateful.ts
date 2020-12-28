import { toBytes } from "algob";

export const accInfo = [{
  address: "addr-1",
  assets: [
    { 'asset-id': 3, amount: 2, creator: "string", 'is-frozen': "false" },
    { 'asset-id': 32, amount: 2, creator: "AS", 'is-frozen': "false" }
  ],
  amount: 123,
  appsLocalState: [{
    id: 1847,
    'key-value': [
      {
        key: toBytes("Local-key"),
        value: {
          bytes: toBytes("Local-val"),
          type: 1,
          uint: 0
        }
      }
    ],
    schema: {
      'num-byte-slice': 2,
      'num-uint': 1
    }
  }],
  appsTotalSchema: { 'num-byte-slice': 583, 'num-uint': 105 },
  createdApps: [{
    id: 1828,
    params: {
      'approval-program': '',
      'clear-state-program': '',
      creator: "addr-1",
      'global-state': [
        {
          key: toBytes("Hello"),
          value: {
            bytes: toBytes("World"),
            type: 1,
            uint: 0
          }
        },
        {
          key: toBytes("global-key"),
          value: {
            bytes: toBytes("global-val"),
            type: 1,
            uint: 0
          }
        }
      ],
      'global-state-schema': { 'num-byte-slice': 3, 'num-uint': 1 },
      'local-state-schema': { 'num-byte-slice': 0, 'num-uint': 16 }
    }
  }],
  'created-assets': [{
    index: 3,
    params: {
      creator: "addr-1",
      total: 10000,
      decimals: 10,
      'default-frozen': "false",
      'unit-name': "AD",
      name: "ASSETAD",
      url: "assetUrl",
      'metadata-hash': "hash",
      manager: "addr-1",
      reserve: "addr-2",
      freeze: "addr-3",
      clawback: "addr-4"
    }
  }]
}];