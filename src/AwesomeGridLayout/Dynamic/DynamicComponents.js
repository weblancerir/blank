import ContainerBase from "../Components/Containers/ContainerBase";
import Header from "../Components/Containers/Header";
import Footer from "../Components/Containers/Footer";
import PageBase from "../Components/Pages/PageBase";
import Section from "../Components/Containers/Section";
import Stack from "../Components/Stack/Stack";
import VerticalSpacer from "../Components/Stack/VerticalSpacer";
import FadeInAnimation from "../Test/Animations/FadeInAnimation";
import BounceInAnimation from "../Test/Animations/BounceInAnimation";
import GlideInAnimation from "../Test/Animations/GlideInAnimation";
import FloatInAnimation from "../Test/Animations/FloatInAnimation";
import ExpandInAnimation from "../Test/Animations/ExpandInAnimation";
import SpinInAnimation from "../Test/Animations/SpinInAnimation";
import FlyInAnimation from "../Test/Animations/FlyInAnimation";
import TurnInAnimation from "../Test/Animations/TurnInAnimation";
import ArcInAnimation from "../Test/Animations/ArcInAnimation";
import PuffInAnimation from "../Test/Animations/PuffInAnimation";
import FoldInAnimation from "../Test/Animations/FoldInAnimation";
import FlipInAnimation from "../Test/Animations/FlipInAnimation";
import RevealAnimation from "../Test/Animations/RevealAnimation";
import Text from "../Components/Text/Text";
import Button from "../Components/Button/Button";
import Image from "../Components/Image/Image";
import Video from "../Components/Video/Video";
import HorizontalMenu from "../Components/Menu/HorizontalMenu";

let DynamicComponents = {};

export let initDynamicComponents = () => {
    DynamicComponents["ContainerBase"] = ContainerBase;
    DynamicComponents["PageBase"] = PageBase;
    DynamicComponents["Header"] = Header;
    DynamicComponents["Footer"] = Footer;
    DynamicComponents["Section"] = Section;
    DynamicComponents["Stack"] = Stack;
    DynamicComponents["VerticalSpacer"] = VerticalSpacer;
    DynamicComponents["Text"] = Text;
    DynamicComponents["Button"] = Button;
    DynamicComponents["Image"] = Image;
    DynamicComponents["Video"] = Video;
    DynamicComponents["HorizontalMenu"] = HorizontalMenu;
};

export default DynamicComponents;

export let DynamicAnimations = {};

export let initDynamicAnimations = () => {
    DynamicAnimations["fadeIn"] = FadeInAnimation;
    DynamicAnimations["bounceIn"] = BounceInAnimation;
    DynamicAnimations["glideIn"] = GlideInAnimation;
    DynamicAnimations["floatIn"] = FloatInAnimation;
    DynamicAnimations["expandIn"] = ExpandInAnimation;
    DynamicAnimations["spinIn"] = SpinInAnimation;
    DynamicAnimations["flyIn"] = FlyInAnimation;
    DynamicAnimations["turnIn"] = TurnInAnimation;
    DynamicAnimations["arcIn"] = ArcInAnimation;
    DynamicAnimations["puffIn"] = PuffInAnimation;
    DynamicAnimations["foldIn"] = FoldInAnimation;
    DynamicAnimations["flipIn"] = FlipInAnimation;
    DynamicAnimations["reveal"] = RevealAnimation;
};
