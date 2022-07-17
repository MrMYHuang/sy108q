import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, withIonLifeCycle, IonToast, IonIcon, IonList, IonItem, IonLabel, IonListHeader, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { checkmarkCircleOutline, helpCircleOutline, trophy } from 'ionicons/icons';

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
  isScrollOn: boolean;
  quoteReads: boolean[];
  showToast: boolean;
  toastMessage: string;
}

interface PageProps extends Props, RouteComponentProps<{
  tab: string;
  id: string
  path: string;
}> { }

class _RecordPage extends React.Component<PageProps, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      isScrollOn: true,
      quoteReads: [],
      showToast: false,
      toastMessage: '',
    };
  }

  ionViewWillEnter() {
    this.loadMoreQuotes();
  }

  page = 0;
  rows = 20;
  loadMoreQuotesLock = false;
  loadMoreQuotes() {
    if (this.loadMoreQuotesLock) {
      return;
    }
    
    this.loadMoreQuotesLock = true;
    let newAppendQuoteReadsRangeEnd = Math.min((this.page + 1) * this.rows, Globals.quotes.length);
    const newAppendQuoteReads = this.props.settings.qouteReads.slice(this.page * this.rows, newAppendQuoteReadsRangeEnd);
    const newQuoteReads = [...this.state.quoteReads, ...newAppendQuoteReads];
    this.setState({
      isScrollOn: newQuoteReads.length < Globals.quotes.length,
      quoteReads: newQuoteReads,
    }, () => {
      this.page++;
      this.loadMoreQuotesLock = false;
    });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>閱讀記錄</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>

          <IonList>
            <IonListHeader className='uiFont select'>成就</IonListHeader>
            {
              [
                {
                  achievement: 27,
                  color: '#61666A',
                  unlock: this.props.settings.is27quotesRead,
                },
                {
                  achievement: 54,
                  color: '#B87333',
                  unlock: this.props.settings.is54quotesRead,
                },
                {
                  achievement: 81,
                  color: '#C0C0C0',
                  unlock: this.props.settings.is81quotesRead,
                },
                {
                  achievement: 108,
                  color: '#FFD700',
                  unlock: this.props.settings.is108quotesRead,
                },
              ].map((a, i) =>
                <IonItem key={`achievement_${i}`}>
                  <IonIcon slot='start' className='uiFont' icon={trophy} style={{ color: a.color }} />
                  <IonLabel className='uiFont'>已讀{a.achievement}則自在語</IonLabel>
                  {
                    a.unlock ?
                      <IonIcon className='uiFont' icon={checkmarkCircleOutline} color='success' />
                      :
                      null
                  }
                </IonItem>
              )
            }
          </IonList>

          <IonList>
            <IonListHeader className='uiFont select'>解鎖自在語</IonListHeader>
            {
              this.state.quoteReads.map((read, i) =>
                <IonItem className='uiFont' button key={`read${i}`} onClick={() => {
                  if (!read) {
                    this.setState({ showToast: true, toastMessage: `自在語 No. ${i + 1} 尚未解鎖！` });
                    return;
                  }

                  this.props.history.push(`${Globals.pwaUrl}/quote/quote/${i + 1}`);
                }}>
                  <IonLabel>
                    No. {i + 1}: {read ? Globals.quotes[i] : null}
                  </IonLabel>
                  {
                    read ?
                      <IonIcon className='uiFont' icon={checkmarkCircleOutline} color='success' />
                      :
                      <IonIcon className='uiFont' icon={helpCircleOutline} color='danger' />
                  }
                </IonItem>)
            }
            <IonInfiniteScroll threshold="100px"
              disabled={!this.state.isScrollOn}
              onIonInfinite={(ev: CustomEvent<void>) => {
                this.loadMoreQuotes();
                (ev.target as HTMLIonInfiniteScrollElement).complete();
              }}>
              <IonInfiniteScrollContent
                loadingText="載入中...">
              </IonInfiniteScrollContent>
            </IonInfiniteScroll>
          </IonList>

          <IonToast
            cssClass='uiFont'
            isOpen={this.state.showToast}
            onDidDismiss={() => this.setState({ showToast: false })}
            message={this.state.toastMessage}
            duration={2000}
          />
        </IonContent>
      </IonPage>
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

const RecordPage = withIonLifeCycle(_RecordPage);

export default connect(
  mapStateToProps,
)(RecordPage);
