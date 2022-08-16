import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, withIonLifeCycle, IonToast, IonButton, IonIcon } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { bookmark, shareSocial } from 'ionicons/icons';
import { withTranslation, WithTranslation } from 'react-i18next';

import { Bookmark } from '../models/Bookmark';
import Globals from '../Globals';
import { Settings } from '../models/Settings';
import { TmpSettings } from '../models/TmpSettings';

interface Props extends WithTranslation{
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

  ionViewDidEnter() {
    this.setState({ quote: this.getQuote() }, async () => {
      await this.fitText(this.props.settings.language === 'zh');

      let qouteReads = JSON.parse(JSON.stringify(this.props.settings.qouteReads)) as boolean[];
      qouteReads[+this.props.match.params.id - 1] = true;

      this.props.dispatch({
        type: "SET_KEY_VAL",
        key: 'qouteReads',
        val: qouteReads,
      });

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
          this.setState({ showUnlockToast: true, unlockToastMessage: `${this.props.t('Unlock')} - ${this.props.t('Read')} ${a.unlockThreshold} ${this.props.t('wisdomAdages').toLowerCase()}` });
        }
      });
    });
  }

  ionViewWillLeave() {
  }

  componentDidMount() {
    new ResizeObserver(() => {
      this.fitText(this.props.settings.language === 'zh');
    }).observe(document.getElementById('quote-container')!);
  }

  getQuote() {
    return Globals.quotes[+this.props.match.params.id - 1];
  }

  async fitText(isZh: boolean = true) {
    //console.log('fitText');
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
    const verticalMode = isZh && h > w;
    quoteContainer.style.writingMode = verticalMode ? 'vertical-rl' : 'horizontal-tb';
    quoteDiv.style.writingMode = verticalMode ? 'vertical-rl' : 'horizontal-tb';

    const n = this.state.quote.length;

    if (n === 0) {
      quoteDiv.style.cssText = `font-size: 12px; width: ${w}px;`;
    } else {
      let textFontSize = 12;
      while (textFontSize < 1024) {
        // eslint-disable-next-line no-loop-func
        quoteDiv.style.cssText = `font-size: ${textFontSize}px; width: ${w}px;`;
        const ws = quoteContainer.scrollWidth;
        const hs = quoteContainer.scrollHeight;
        if ((verticalMode && ws > w) || (!verticalMode && hs > h)) {
          quoteDiv.style.cssText = `font-size: ${textFontSize - 1}px; width: ${w}px;`;
          break;
        }

        textFontSize += 1;
      }
    }
  }

  addBookmarkHandler() {
    this.props.dispatch({
      type: "ADD_BOOKMARK",
      bookmark: ({
        uuid: +this.props.match.params.id,
      }) as Bookmark,
    });
    this.setState({ showToast: true, toastMessage: this.props.t('NewBookmarkAdded') });
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
          <div id='quote-container' style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }} onClick={() => {
            //this.props.history.push(`${Globals.pwaUrl}/quote/select`);
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
                text: this.props.t('Close'),
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

export default withTranslation()(connect(
  mapStateToProps,
)(QuotePage));
