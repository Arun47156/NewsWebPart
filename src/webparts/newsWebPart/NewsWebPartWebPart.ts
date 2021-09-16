import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'NewsWebPartWebPartStrings';
import NewsWebPart from './components/NewsWebPart';
import { INewsWebPartProps } from './components/INewsWebPartProps';

export interface INewsWebPartWebPartProps {
  title: string;
}

export default class NewsWebPartWebPart extends BaseClientSideWebPart<INewsWebPartWebPartProps> {

  public render(): void {
    const element: React.ReactElement<INewsWebPartProps> = React.createElement(
      NewsWebPart,
      {
        title: this.properties.title,
        webURL:this.context.pageContext.web.absoluteUrl,
        context:this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.DescriptionFieldLabel,
                  value: strings.DefaultTitle
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
