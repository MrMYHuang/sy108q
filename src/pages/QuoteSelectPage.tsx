import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, withIonLifeCycle, IonToast, IonButton, IonIcon, IonInput } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { shareSocial } from 'ionicons/icons';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Bookmark } from '../models/Bookmark';
import Globals from '../Globals';
import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';

interface Props extends WithTranslation {
  bookmarks: Bookmark[];
  dispatch: Function;
  settings: Settings;
  tmpSettings: TmpSettings;
}

interface State {
  quote: string;
  customQuoteId: string;
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
      customQuoteId: '1',
      showToast: false,
      toastMessage: '',
    }
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>{this.props.t('108WisdomAdages')}</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              Globals.shareByLink(this.props.dispatch, decodeURIComponent(window.location.href));
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>

          <div className='uiFont' style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '0px 20px' }}>
            <div>
              <div style={{ padding: '20px 0px' }}>
                <IonInput className='uiFont' inputmode='numeric' value={this.state.customQuoteId}
                  onIonChange={(ev) => {
                    this.setState({ customQuoteId: `${ev.target.value}` })
                  }}>No.&nbsp;</IonInput>
              </div>
              <div style={{textAlign: 'center'}}>
                <IonButton className='uiFont' fill='outline' shape='round' size='large' onClick={() => {
                  const quoteId = +this.state.customQuoteId;
                  if (isNaN(quoteId) || 1 > quoteId || quoteId > 108) {
                    this.setState({showToast: true, toastMessage: `請輸入介於1到108之間的數字`});
                    return;
                  }
                  
                  this.props.history.push(`${Globals.pwaUrl}/quote/quote/${this.state.customQuoteId}`);
                }}>{this.props.t('SelectByNumber')}</IonButton>
              </div>
            </div>

            <div className='uiFont'>---------- or ----------</div>

            <div style={{ padding: '20px 0px' }}>
              <IonButton className='uiFont' fill='outline' shape='round' size='large' onClick={() => {
                const quoteId = Math.floor(Math.random() * Globals.quotes.length) + 1;
                this.props.history.push(`${Globals.pwaUrl}/quote/quote/${quoteId}`);
              }}>{this.props.t('SelectByRandom')}</IonButton>
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

export default withTranslation()(connect(
  mapStateToProps,
)(QuotePage));
