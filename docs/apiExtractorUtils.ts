import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('server.api.json');

apiPackage.members;

for (const member of apiPackage.members) {
  console.log(member.displayName);
}
