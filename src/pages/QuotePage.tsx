import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, withIonLifeCycle, IonToast, IonButton, IonIcon } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { bookmark, shareSocial } from 'ionicons/icons';

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
  showToast: boolean;
  toastMessage: string;
  showUnlockToast: boolean;
  unlockToastMessage: string;
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
      quote: this.getQuote(),
      showToast: false,
      toastMessage: '',
      showUnlockToast: false,
      unlockToastMessage: '',
    };
  }

  ionViewWillEnter() {
    this.setState({ quote: this.getQuote() }, () => {
      this.fitText();

      let qouteReads = JSON.parse(JSON.stringify(this.props.settings.qouteReads)) as boolean[];
      qouteReads[+this.props.match.params.id - 1] = true;

      const quoteReadsCount = qouteReads.reduce((prev, curr) => prev + (curr ? 1 : 0), 0);

      [
        {
          unlockThreshold: 27,
          isUnlock: this.props.settings.is27quotesRead,
          achievemnt: 'is27quotesRead',
        },
        {
          unlockThreshold: 54,
          isUnlock: this.props.settings.is54quotesRead,
          achievemnt: 'is54quotesRead',
        },
        {
          unlockThreshold: 81,
          isUnlock: this.props.settings.is81quotesRead,
          achievemnt: 'is81quotesRead',
        },
        {
          unlockThreshold: 108,
          isUnlock: this.props.settings.is108quotesRead,
          achievemnt: 'is108quotesRead',
        },
      ].forEach(a => {
        if (a.unlockThreshold <= quoteReadsCount && !a.isUnlock) {
          this.props.dispatch({
            type: "SET_KEY_VAL",
            key: a.achievemnt,
            val: true,
          });
          this.setState({ showUnlockToast: true, unlockToastMessage: `解鎖 - 已讀 ${a.unlockThreshold} 則自在語` });
        }
      });

      this.props.dispatch({
        type: "SET_KEY_VAL",
        key: 'qouteReads',
        val: qouteReads,
      });
    });
  }

  ionViewWillLeave() {
    this.setState({ quote: '' }, () => {
      this.fitText();
    });
  }

  getQuote() {
    return Globals.quotes[+this.props.match.params.id - 1];
  }

  fitText() {
    const quoteDiv = document.getElementById('quote');
    if (!quoteDiv) {
      return;
    }

    const quoteContainer = document.getElementById('quote-container');
    if (!quoteContainer) {
      return;
    }

    const w = quoteContainer.clientWidth;
    const h = quoteContainer.clientHeight;
    const verticalMode = h > w;
    quoteContainer.style.writingMode = verticalMode ? 'vertical-rl' : 'horizontal-tb';
    quoteDiv.style.writingMode = verticalMode ? 'vertical-rl' : 'horizontal-tb';

    const n = this.state.quote.length;
    const maxTextFontSize = Math.sqrt(w * h / n);

    let textFontSize = Math.floor(maxTextFontSize);
    while (textFontSize > 0) {
      quoteDiv.style.fontSize = `${textFontSize}px`;
      const ws = quoteContainer.scrollWidth;
      const hs = quoteContainer.scrollHeight;
      if (verticalMode && ws <= w) {
        break;
      } else if (!verticalMode && hs <= h) {
        break
      }

      textFontSize -= 1;
    }
  }

  addBookmarkHandler() {
    this.props.dispatch({
      type: "ADD_BOOKMARK",
      bookmark: ({
        uuid: +this.props.match.params.id,
      }) as Bookmark,
    });
    this.setState({ showToast: true, toastMessage: '書籤新增成功！' });
    return;
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className='uiFont'>No. {+this.props.match.params.id}</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              this.addBookmarkHandler();
            }}>
              <IonIcon icon={bookmark} slot='icon-only' />
            </IonButton>

            <IonButton fill="clear" slot='end' onClick={e => {
              Globals.shareByLink(this.props.dispatch, decodeURIComponent(window.location.href));
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div id='quote-container' style={{ width: '100%', height: '100%' }} onClick={() => {
            this.props.history.push(`${Globals.pwaUrl}/quote/select`);
          }}>
            <div id='quote'>{this.state.quote}</div>
          </div>

          <IonToast
            cssClass='uiFont'
            isOpen={this.state.showToast}
            onDidDismiss={() => this.setState({ showToast: false })}
            message={this.state.toastMessage}
            duration={2000}
          />

          <IonToast
            cssClass='uiFont toastSuccess'
            isOpen={this.state.showUnlockToast}
            onDidDismiss={() => this.setState({ showUnlockToast: false })}
            message={this.state.unlockToastMessage}
            buttons={[
              {
                text: '關閉',
                role: 'cancel',
              }
            ]}
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

const QuotePage = withIonLifeCycle(_QuotePage);

export default connect(
  mapStateToProps,
)(QuotePage);
