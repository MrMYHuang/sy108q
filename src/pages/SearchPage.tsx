import React, { ReactNode } from 'react';
import { IonContent, IonHeader, IonPage, IonToolbar, withIonLifeCycle, IonButton, IonIcon, IonSearchbar, IonList, IonItem, IonLabel, IonToast, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import Globals from '../Globals';
import { shareSocial } from 'ionicons/icons';
import { Settings } from '../models/Settings';

interface Props {
  dispatch: Function;
  settings: Settings;
}

interface PageProps extends Props, RouteComponentProps<{
  path: string;
  tab: string;
  keyword: string;
}> { }

interface State {
  keyword: string;
  searches: number[];
  popover: any;
  isScrollOn: boolean;
  showToast: boolean;
  toastMessage: string;
}

class _SearchPage extends React.Component<PageProps, State> {
  searchBarRef: React.RefObject<HTMLIonSearchbarElement>;
  constructor(props: any) {
    super(props);
    this.state = {
      keyword: '',
      searches: [],
      popover: {
        show: false,
        event: null,
      },
      isScrollOn: false,
      showToast: false,
      toastMessage: '',
    }
    this.searchBarRef = React.createRef<HTMLIonSearchbarElement>();
    this.filteredData = [];
  }

  ionViewWillEnter() {
    //console.log(`${this.props.match.url} will enter`);
    const keyword = this.props.match.params.keyword;
    this.setState({ keyword: keyword }, () => {
      this.search(true);
    });
  }

  /*
  componentDidMount() {
    //console.log(`did mount: ${this.props.match.url}`);
  }
  
  componentWillUnmount() {
    console.log(`${this.props.match.url} unmount`);
  }

  ionViewWillLeave() {
  }
  */

  page = 0;
  rows = 20;
  filteredData: number[];
  async search(newSearch: boolean = false) {
    if (this.props.match.params.keyword == null || this.props.match.params.keyword !== this.state.keyword) {
      return;
    }

    if (newSearch) {
      const re = new RegExp(`.*${this.props.match.params.keyword}.*`, 'i');
      this.filteredData = Globals.quotes.map((quote, i) => re.test(quote) ? (i + 1) : -1).filter(v => v !== -1);
      this.page = 0;
    }

    console.log(`Loading page ${this.page}`);

    const searches = this.filteredData.slice(this.page * this.rows, (this.page + 1) * this.rows);

    this.page += 1;
    this.setState({
      searches: newSearch ? searches : [...this.state.searches, ...searches],
      isScrollOn: this.state.searches.length < this.filteredData.length,
    });

    if (newSearch) {
      let dictionaryHistory = JSON.parse(JSON.stringify(this.props.settings.dictionaryHistory));
      dictionaryHistory.unshift(this.state.keyword);
      dictionaryHistory.splice(10);
      this.props.dispatch({
        type: "SET_KEY_VAL",
        key: 'dictionaryHistory',
        val: dictionaryHistory,
      });
    }
    return true;
  }

  getRows() {
    const data = this.state.searches;
    let rows = new Array<ReactNode>();
    data.forEach((quoteId: number) => {
      rows.push(
        <IonItem button={true} key={`quote` + quoteId}
          onClick={async event => {
            this.props.history.push({
              pathname: `${Globals.pwaUrl}/quote/quote/${quoteId}`,
            });
          }}>
          <div tabIndex={0}></div>{/* Workaround for macOS Safari 14 bug. */}
          <IonLabel className='uiFont' key={`quoteLabel_` + quoteId}>
            No. {quoteId}: {Globals.quotes[quoteId - 1]}
          </IonLabel>
        </IonItem>
      );
    });
    return rows;
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle style={{ fontSize: 'var(--ui-font-size)' }}>搜尋自在語</IonTitle>

            <IonButton fill="clear" slot='end' onClick={e => {
              Globals.shareByLink(this.props.dispatch, decodeURIComponent(window.location.href));
            }}>
              <IonIcon icon={shareSocial} slot='icon-only' />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonSearchbar ref={this.searchBarRef} placeholder='按 Enter 搜尋' value={this.state.keyword}
            onIonClear={ev => {
              this.props.history.push({
                pathname: `${Globals.pwaUrl}/search`,
              });
            }}
            onKeyUp={(ev: any) => {
              const value = ev.target.value;
              this.setState({ keyword: value }, () => {
                if (value === '') {
                } else if (ev.key === 'Enter') {
                  if (value === this.props.match.params.keyword) {
                    this.search(true);
                  } else {
                    this.props.history.push({
                      pathname: `${Globals.pwaUrl}/search/${value}`,
                    });
                  }
                }
              });
            }}
          />

          {
            this.props.match.params.keyword == null || this.state.searches.length < 1 || (this.props.settings.dictionaryHistory.length > 0 && (this.state.keyword === '' || this.state.keyword === undefined)) ?
              <>
                <div className='uiFont' style={{ color: 'var(--ion-color-primary)' }}>搜尋歷史</div>
                <IonList>
                  {this.props.settings.dictionaryHistory.map((keyword, i) =>
                    <IonItem key={`dictHistoryItem_${i}`} button={true} onClick={async event => {
                      if (keyword === this.props.match.params.keyword) {
                        //                        this.setState({ keyword });
                        //                        this.search(true);
                      }
                      else {
                        this.props.history.push({
                          pathname: `${Globals.pwaUrl}/search/${keyword}`,
                        });
                      }
                    }}>
                      <IonLabel className='ion-text-wrap uiFont' key={`dictHistoryLabel_` + i}>
                        {keyword}
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
                <div style={{ textAlign: 'center' }}>
                  <IonButton fill='outline' shape='round' size='large' onClick={e => {
                    this.setState({ keyword: '' });
                    this.props.dispatch({
                      type: "SET_KEY_VAL",
                      key: 'dictionaryHistory',
                      val: [],
                    });
                  }}>清除歷史</IonButton>
                </div>
              </>
              :
              <IonList>
                {this.getRows()}
                <IonInfiniteScroll threshold="100px"
                  disabled={!this.state.isScrollOn}
                  onIonInfinite={(ev: CustomEvent<void>) => {
                    this.search();
                    (ev.target as HTMLIonInfiniteScrollElement).complete();
                  }}>
                  <IonInfiniteScrollContent
                    loadingText="載入中...">
                  </IonInfiniteScrollContent>
                </IonInfiniteScroll>
              </IonList>
          }

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

const SearchPage = withIonLifeCycle(_SearchPage);

const mapStateToProps = (state: any /*, ownProps*/) => {
  return {
    settings: state.settings,
  };
};

//const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
)(SearchPage);
