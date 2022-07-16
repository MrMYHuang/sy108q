import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, withIonLifeCycle, IonToast, IonButton, IonIcon, IonInput } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { shareSocial } from 'ionicons/icons';

import { Bookmark } from '../models/Bookmark';
import Globals from '../Globals';
import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';

interface Props {
  bookmarks: Bookmark[];
  dispatch: Function;
  settings: Settings;
  tmpSettings: TmpSettings;
}

interface State {
  quote: string;
  customQuoteId: number;
  showToast: boolean;
  toastMessage: string;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  id: string
  path: string;
}> { }

class _QuotePage extends React.Component<PageProps, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      quote: '',
      customQuoteId: 1,
      showToast: false,
      toastMessage: '',
    }
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>壹零捌自在語</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              Globals.shareByLink(this.props.dispatch, decodeURIComponent(window.location.href));
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>

          <div className='uiFont' style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center', alignItems: 'center', justifyContent: 'space-between', padding: '0px 20px' }}>
            <div>
              <div style={{ padding: '20px 20px' }}>
                <IonInput className='uiFont' inputmode='numeric' value={this.state.customQuoteId}
                  onIonChange={(ev) => {
                    this.setState({ customQuoteId: +(ev.target.value || 1) })
                  }} />
              </div>
              <div style={{ padding: '20px 20px' }}>
                <IonButton style={{ fontSize: `${this.props.settings.uiFontSize * 1.5}px` }} fill='outline' shape='round' size='large' onClick={() => {
                  this.props.history.push(`${Globals.pwaUrl}/quote/quote/${this.state.customQuoteId}`);
                }}>自選自在語</IonButton>
              </div>
            </div>

            <div className='uiFont'>---------- or ----------</div>

            <div style={{ padding: '20px 0px' }}>
              <IonButton style={{ fontSize: `${this.props.settings.uiFontSize * 1.5}px` }} fill='outline' shape='round' size='large' onClick={() => {
                const quoteId = Math.floor(Math.random() * Globals.quotes.length) + 1;
                this.props.history.push(`${Globals.pwaUrl}/quote/quote/${quoteId}`);
              }}>隨選自在語</IonButton>
            </div>
          </div>

          <IonToast
            cssClass='uiFont'
            isOpen={this.state.showToast}
            onDidDismiss={() => this.setState({ showToast: false })}
            message={this.state.toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonPage >
    );
  }
};

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    bookmarks: JSON.parse(JSON.stringify(state.settings.bookmarks)),
    settings: state.settings,
    tmpSettings: state.tmpSettings,
  }
};

//const mapDispatchToProps = {};

const QuotePage = withIonLifeCycle(_QuotePage);

export default connect(
  mapStateToProps,
)(QuotePage);
