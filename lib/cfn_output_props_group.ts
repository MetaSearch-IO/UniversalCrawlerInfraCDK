import {
  CfnOutputProps,
  generateCfnOutputPropsGroupWithEnvInfo,
  KAITO_DATA_KNOWLEDGE_ASSET_BUCKET_ARN_CFN_OUTPUT_PROPS,
} from '@meta-search/kaito-cdk-construct';
import { DEPLOYMENT_ENVIRONMENTS } from './constants';

export const cfnOutputPropsGroups: Record<string, Record<string, CfnOutputProps>> = {
  kaitoDataKnowledgeAssetBucketArn: generateCfnOutputPropsGroupWithEnvInfo(
    DEPLOYMENT_ENVIRONMENTS,
    KAITO_DATA_KNOWLEDGE_ASSET_BUCKET_ARN_CFN_OUTPUT_PROPS,
  ),
};
