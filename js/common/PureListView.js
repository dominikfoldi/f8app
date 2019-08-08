/**
 * Copyright 2016 Facebook, Inc.
 *
 * You are hereby granted a non-exclusive, worldwide, royalty-free license to
 * use, copy, modify, and distribute this software in source code or binary
 * form for use in connection with the web services and APIs provided by
 * Facebook.
 *
 * As with any software that integrates with the Facebook platform, your use
 * of this software is subject to the Facebook Developer Principles and
 * Policies [http://developers.facebook.com/policy/]. This copyright notice
 * shall be included in all copies or substantial portions of the software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE
 */
"use strict";

import { FlatList } from 'react-native';
import Platform from "Platform";
import React from "react";

type RenderElement = () => ?ReactElement;

type Props = {
  data: [],
  renderEmptyList?: ?RenderElement,
  minContentHeight: number,
  contentInset: { top: number, bottom: number }
};

type State = {
  contentHeight: number,
  data: []
};

// FIXME: Android has a bug when scrolling FlatList the view insertions
// will make it go reverse. Temporary fix - pre-render more rows
const LIST_VIEW_PAGE_SIZE = Platform.OS === "android" ? 20 : 10;

class PureListView extends React.Component {
  props: Props;
  state: State;

  static defaultProps = {
    data: [],
    contentInset: { top: 0, bottom: 0 },
    // TODO: This has to be scrollview height + fake header
    minContentHeight: 0
    // renderSeparator: (sectionID, rowID) => <View style={styles.separator} key={rowID} />,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      contentHeight: 0,
      containerHeight: 0,
      data: props.data ? props.data : []
    };

    (this: any).renderFooter = this.renderFooter.bind(this);
    (this: any).renderHeader = this.renderHeader.bind(this);
    (this: any).onContentSizeChange = this.onContentSizeChange.bind(this);
  }

  render() {
    const { contentInset } = this.props;
    const bottom =
      contentInset.bottom +
      Math.max(0, this.props.minContentHeight - this.state.contentHeight);
    return (
      <FlatList
        initialListSize={10}
        pageSize={LIST_VIEW_PAGE_SIZE}
        enableEmptySections={true}
        removeClippedSubviews={false}
        {...this.props}
        ref={c => (this._listview = c)}
        data={this.state.data}
        renderHeader={this.renderHeader}
        ListFooterComponent={this.renderFooter}
        keyExtractor={(item, index) => index}
        contentInset={{ bottom, top: contentInset.top }}
        onContentSizeChange={this.onContentSizeChange}
        onLayout={event => {
          const { height } = event.nativeEvent.layout;
          if (this.state.containerHeight !== height) {
            this.setState({ containerHeight: height });
          }
        }}
      />
    );
  }

  onContentSizeChange(contentWidth: number, contentHeight: number) {
    if (contentHeight !== this.state.contentHeight) {
      this.setState({ contentHeight });
    }
  }

  scrollTo(...args: Array<any>) {
    this._listview.scrollTo(...args);
  }

  getScrollResponder(): any {
    return this._listview.getScrollResponder();
  }

  renderHeader(): ?ReactElement {
    if (this.state.data.length != 0) {
      return this.props.renderHeader && this.props.renderHeader();
    }
  }

  renderFooter(): ?ReactElement {
    if (this.state.data.count === 0) {
      return (
        this.props.renderEmptyList &&
        this.props.renderEmptyList(this.state.containerHeight)
      );
    }

    return this.props.renderFooter && this.props.renderFooter();
  }
}

module.exports = PureListView;
