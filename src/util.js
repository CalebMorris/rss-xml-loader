/* eslint no-param-reassign: 0 */

export function stripSingleItemArrayFromXMLObject(nodeData: any): any {
  if (nodeData && typeof nodeData === 'object') {
    Object.keys(nodeData).forEach((key: string) => {
      if (Array.isArray(nodeData[key]) && nodeData[key].length === 1) {
        nodeData[key] = stripSingleItemArrayFromXMLObject(nodeData[key][0]);
      } else {
        nodeData[key] = stripSingleItemArrayFromXMLObject(nodeData[key]);
      }
    });
  }
  return nodeData;
}
