import React from "react";
import '../../../../Menus/Menu.css';
import GridViewer from "../../../../Menus/CommonComponents/GridViewer";
import classNames from "classnames";
import ButtonBase from "@material-ui/core/ButtonBase/ButtonBase";

export default class AnimationSelector extends React.Component {
    onSelectAnimation = (name) => {
        this.props.onDesignChange(this.props.designKey, name);
        window.requestAnimationFrame(() => {
            this.props.item.playAnimation();
        });
    };

    render () {
        let {allAnimationNames, animation} = this.props;
        let noneClasses = classNames(
            "MenuOptionAnimationItem",
            (!animation || !animation.name) && "MenuOptionAnimationItemSelected"
        );
        return (
            <div className="MenuOptionSection">

                <GridViewer>
                    <ButtonBase
                        className={noneClasses}
                        key='none'
                        onClick={(e) => this.onSelectAnimation()}
                    >
                        <img
                            className="MenuOptionAnimationItemImage"
                            draggable={false} width={48} height={48}
                            // src={process.env.PUBLIC_URL + `/static/icons/animation/${name}.svg`} />
                            src={process.env.PUBLIC_URL + `/static/icon/animation-black.svg`}
                        />
                        <span>
                            none
                        </span>
                    </ButtonBase>
                    {
                        allAnimationNames.map(name => {
                            let classes = classNames(
                                "MenuOptionAnimationItem",
                                animation && name === animation.name && "MenuOptionAnimationItemSelected"
                            );
                            let displayName = name.split(/(?=[A-Z])/).join(' ');
                            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                            return (
                                <ButtonBase
                                    className={classes}
                                    key={name}
                                    onClick={(e) => this.onSelectAnimation(name)}
                                >
                                    <img
                                        className="MenuOptionAnimationItemImage"
                                        draggable={false} width={48} height={48}
                                        // src={process.env.PUBLIC_URL + `/static/icons/animation/${name}.svg`} />
                                        src={process.env.PUBLIC_URL + `/static/icon/animation-black.svg`}
                                    />
                                    <span className="MenuOptionAnimationItemTitle">
                                        {displayName}
                                    </span>
                                </ButtonBase>
                            )
                        })
                    }
                </GridViewer>
            </div>
        )
    }
}
