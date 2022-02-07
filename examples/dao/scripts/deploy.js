const { types } = require('@algo-builder/web');
const { fundAccount, tryExecuteTx } = require('./run/common/common.js');

const { accounts, getDAOFundLsig } = require('./run/common/accounts');
const { getApplicationAddress } = require('algosdk');

async function run (runtimeEnv, deployer) {
  const { creator, proposer, voterA, voterB } = accounts(deployer);

  // fund accounts
  await fundAccount(deployer, [creator, proposer, voterA, voterB]);

  // Create DAO Gov Token
  const govToken = await deployer.deployASA('gov-token', { creator: creator });
  console.log(govToken);

  // DAO App initialization parameters
  const deposit = 15; // deposit required to make a proposal
  const minSupport = 5; // minimum number of yes power votes to validate proposal
  const minDuration = 1 * 60; // 1min (minimum voting time in number of seconds)
  const maxDuration = 5 * 60; // 5min (maximum voting time in number of seconds)
  const url = 'www.my-url.com';

  const appArgs = [
    `int:${deposit}`,
    `int:${minSupport}`,
    `int:${minDuration}`,
    `int:${maxDuration}`,
    `str:${url}`
  ];
  const templateParam = { ARG_GOV_TOKEN: govToken.assetIndex };
  // Create Application
  const daoAppInfo = await deployer.deployApp(
    'dao-app-approval.py',
    'dao-app-clear.py', {
      sender: creator,
      localInts: 9,
      localBytes: 7,
      globalInts: 4,
      globalBytes: 2,
      appArgs: appArgs
    }, {}, templateParam);
  console.log(daoAppInfo);

  // Fund application account with some ALGO(5)
  const fundAppParameters = {
    type: types.TransactionType.TransferAlgo,
    sign: types.SignType.SecretKey,
    fromAccount: creator,
    toAccountAddr: getApplicationAddress(daoAppInfo.appID),
    amountMicroAlgos: 15e6,
    payFlags: { totalFee: 1000 }
  };

  console.log(`Funding DAO App (ID = ${daoAppInfo.appID})`);
  await tryExecuteTx(deployer, fundAppParameters);

  // opt in deposit account (dao app account) to gov_token asa
  const optInToGovASAParam = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: creator,
    appID: daoAppInfo.appID,
    payFlags: { totalFee: 2000 },
    foreignAssets: [govToken.assetIndex],
    appArgs: ['str:optin_gov_token']
  };
  await tryExecuteTx(deployer, optInToGovASAParam);

  // fund lsig's
  await Promise.all([
    deployer.fundLsig('dao-fund-lsig.py',
      { funder: creator, fundingMicroAlgo: 5e6 }, {}, // 5 algo
      { ARG_GOV_TOKEN: govToken.assetIndex, ARG_DAO_APP_ID: daoAppInfo.appID }),

    deployer.fundLsig('proposal-lsig.py',
      { funder: creator, fundingMicroAlgo: 5e6 }, {}, // 5 algo
      { ARG_OWNER: proposer.addr, ARG_DAO_APP_ID: daoAppInfo.appID })
  ]);

  console.log('* ASA distribution (Gov tokens) *');
  const daoFundLsig = await getDAOFundLsig(deployer);
  await Promise.all([
    deployer.optInLsigToASA(govToken.assetIndex, daoFundLsig, { totalFee: 1000 }),
    deployer.optInAccountToASA(govToken.assetIndex, proposer.name, {}),
    deployer.optInAccountToASA(govToken.assetIndex, voterA.name, {}),
    deployer.optInAccountToASA(govToken.assetIndex, voterB.name, {})
  ]);

  const distributeGovTokenParams = {
    type: types.TransactionType.TransferAsset,
    sign: types.SignType.SecretKey,
    fromAccount: creator,
    amount: 100,
    assetID: govToken.assetIndex,
    payFlags: { totalFee: 1000 }
  };
  await tryExecuteTx(deployer, [
    { ...distributeGovTokenParams, toAccountAddr: proposer.addr },
    { ...distributeGovTokenParams, toAccountAddr: voterA.addr },
    { ...distributeGovTokenParams, toAccountAddr: voterB.addr }
  ]);

  console.log('Contracts deployed successfully!');
}

module.exports = { default: run };
