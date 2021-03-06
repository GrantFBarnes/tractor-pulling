import React, { Component } from "react";
import { Loading } from "carbon-components-react";
import {
    Header,
    HeaderName,
    HeaderMenuButton,
    SideNav,
    SideNavItems,
    SideNavLink
} from "carbon-components-react/lib/components/UIShell";

import ChartBar20 from "@carbon/icons-react/lib/chart--bar/20";
import ChartLine20 from "@carbon/icons-react/lib/chart--line/20";
import Hashtag32 from "@carbon/icons-react/lib/hashtag/32";
import Home20 from "@carbon/icons-react/lib/home/20";
import ListNum32 from "@carbon/icons-react/lib/list--numbered/32";
import Percent32 from "@carbon/icons-react/lib/percentage/32";
import Rivals32 from "@carbon/icons-react/lib/partnership/32";
import Ruler32 from "@carbon/icons-react/lib/ruler/32";
import Trophy32 from "@carbon/icons-react/lib/trophy/32";
import YouTube20 from "@carbon/icons-react/lib/logo--youtube/20";

import "../styling/BasePage.scss";

class BasePage extends Component {
    constructor() {
        super();

        this.state = { loading: true, smallWindow: false, sideExpanded: false };
        this.server_host = window.location.origin;
        if (this.server_host.indexOf("localhost") >= 0) {
            this.server_host = "http://localhost:8080";
        }

        this.buttons = {
            home: {
                text: "Home",
                icon: Home20,
                href: "/home",
                full: false,
                sideOnly: true
            },
            results: {
                text: "Results",
                icon: ListNum32,
                href: "/results",
                full: true,
                sideOnly: false
            },
            wins: {
                text: "Wins",
                icon: Trophy32,
                href: "/wins",
                full: false,
                sideOnly: false
            },
            points: {
                text: "Points",
                icon: Hashtag32,
                href: "/points",
                full: false,
                sideOnly: false
            },
            percentiles: {
                text: "Percentiles",
                icon: Percent32,
                href: "/percentiles",
                full: false,
                sideOnly: false
            },
            distances: {
                text: "Distances",
                icon: Ruler32,
                href: "/distances",
                full: false,
                sideOnly: false
            },
            resultAnalysis: {
                text: "Result Analysis",
                icon: ChartBar20,
                href: "/analysis/results",
                full: false,
                sideOnly: false
            },
            pullerAnalysis: {
                text: "Puller Analysis",
                icon: ChartLine20,
                href: "/analysis/pullers",
                full: false,
                sideOnly: false
            },
            rivals: {
                text: "Rivals",
                icon: Rivals32,
                href: "/rivals",
                full: false,
                sideOnly: false
            },
            youtube: {
                text: "YouTube",
                icon: YouTube20,
                href:
                    "https://www.youtube.com/channel/UCIJUfssINon5pT4x9R25Iyg",
                target: "_blank",
                full: false,
                sideOnly: true
            }
        };
    }

    genSideNavLink = button => {
        return (
            <SideNavLink
                key={button.text}
                renderIcon={button.icon}
                href={button.href}
                target={button.target}
            >
                {button.text}
            </SideNavLink>
        );
    };

    genSideNav = () => {
        let buttons = [];
        for (let text in this.buttons) {
            buttons.push(this.genSideNavLink(this.buttons[text]));
        }
        return buttons;
    };

    downloadFile = (type, name, content) => {
        let typeKey = "";
        switch (type) {
            case "excel":
                typeKey =
                    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
                break;

            case "csv":
                typeKey = "data:text/csv;charset=utf-8,";
                break;

            case "text":
                typeKey = "data:text/json;charset=utf-8,";
                break;

            case "pdf":
                typeKey = "data:application/pdf;base64,";
                break;

            default:
                break;
        }

        const element = document.createElement("a");
        element.setAttribute("href", typeKey + encodeURIComponent(content));
        element.setAttribute("download", name);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    setUp() {
        this.setState({ loading: false });
    }

    updatePageWidth() {
        this.setState({
            sideExpanded: window.innerWidth > 1056,
            smallWindow: window.innerWidth < 700
        });
    }

    componentWillMount() {
        this.setUp();
        this.updatePageWidth();
        window.addEventListener("resize", this.updatePageWidth.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updatePageWidth.bind(this));
    }

    getContainerClass() {
        if (this.state.sideExpanded) {
            return "container containerSideExpanded";
        }
        return "container containerSideCollapsed";
    }

    titleRender() {
        return "";
    }

    contentRender() {
        return null;
    }

    render() {
        return (
            <div className={this.getContainerClass()}>
                {this.state.loading ? <Loading withOverlay={true} /> : null}
                <Header aria-label="header">
                    <HeaderMenuButton
                        aria-label="header menu button"
                        onClick={() => {
                            this.setState({
                                sideExpanded: !this.state.sideExpanded
                            });
                        }}
                        isActive={this.state.sideExpanded}
                    />
                    <HeaderName prefix="CATP" href="/home">
                        Tractor Pulling
                    </HeaderName>
                    <SideNav
                        aria-label="side nav"
                        expanded={this.state.sideExpanded}
                    >
                        <SideNavItems>{this.genSideNav()}</SideNavItems>
                    </SideNav>
                </Header>
                <div className="pageContainer">
                    <h3 className="titleHeader">{this.titleRender()}</h3>
                    {this.contentRender()}
                </div>
            </div>
        );
    }
}

export default BasePage;
