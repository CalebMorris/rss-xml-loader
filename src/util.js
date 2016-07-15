/* eslint no-param-reassign: 0 */

export function stripSingleItemArrayFromXMLObject(nodeData: any): any {
  if (nodeData && typeof nodeData === 'object') {
    Object.keys(nodeData).forEach((key: string) => {
      if (Array.isArray(nodeData) && nodeData.length === 1) {
        nodeData[key] = stripSingleItemArrayFromXMLObject(nodeData[0]);
      }
    });
  }
  return nodeData;
}
