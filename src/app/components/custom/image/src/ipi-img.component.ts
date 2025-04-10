import { ChangeDetectorRef, Component, ElementRef, Inject, Input, Renderer2, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';

import { IpiImgService } from './ipi-img.service';

class ImageHelper {
  loaded = false;
  imgSub?: Subscription;
}

@Component({
  selector: 'ipi-img',
  template: '<ng-content></ng-content>',
})

export class IpiImageComponent {

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private imgService: IpiImgService,
    @Inject(DOCUMENT) private document: Document,
    private changeDetectorRef: ChangeDetectorRef) {
      this.changeDetectorRef.detach();
  }

  @Input() src!: string;
  @Input() ariaLabel!: string;

  private helper = new ImageHelper();

  public ngOnInit(): void {
    this.init();
  }

  public ngOnDestroy(): void {
    this.destroy();
  }

  public ngOnChanges(changeRecord: SimpleChanges): void {
    if (!this.helper.loaded) {
      return;
    }

    if (changeRecord['src']) {
      this.destroy();

      this.init();
    }

    if (changeRecord['ariaLabel']) {
      this.setAriaLabel(changeRecord['ariaLabel'].currentValue);
    }
  }

  private init(): void {
    if (!this.src || !this.ariaLabel) {
      return;
     }

    const img = this.imgService.loadImg(this.src);

    if (typeof img === 'string') {
      this.initImage(img);

      return;
    }

    this.helper.imgSub = img.subscribe(img => { this.initSvg(img); });
  }

  private destroy(): void {
    if (this.helper.imgSub) {
      this.helper.imgSub.unsubscribe();
    }

    this.helper = new ImageHelper();
  }

  private initImage(url: string): void {
    const img = this.document.createElement('img');
    img.onerror = () => { this.onImgError(elem, img); };
  
    const elem = this.element.nativeElement;
    elem.innerHTML = '';

    this.setStyling(img);

    img.src = url;

    this.renderer.appendChild(elem, img);
    this.setAriaLabel(this.ariaLabel);
  
    this.helper.loaded = true;
    this.copyNgContentAttribute(elem, img);
  }

  private initSvg(svg: SVGElement): void {
    if (this.helper.loaded || !svg) {
      return;
    }

    const clonedSvg = svg.cloneNode(true) as SVGElement;

    this.setStyling(clonedSvg);

    const elem = this.element.nativeElement;
    elem.innerHTML = '';

    this.renderer.appendChild(elem, clonedSvg);
    this.helper.loaded = true;

    if (!(this.ariaLabel === undefined && elem.firstChild.hasAttribute('aria-label')) && this.ariaLabel) {
      this.setAriaLabel(this.ariaLabel);
    }

    this.copyNgContentAttribute(elem, clonedSvg);
  }

  private setAriaLabel(label: string): void {
    const img = this.element.nativeElement.firstChild;

    if (img) {
      if (label === '') {
        this.renderer.setAttribute(img, 'aria-hidden', 'true');
        this.renderer.removeAttribute(img, 'aria-label');
      } else {
        this.renderer.removeAttribute(img, 'aria-hidden');
        this.renderer.setAttribute(img, 'aria-label', label);
      }
    }
  }

  private setStyling(element: SVGElement | HTMLImageElement) {
    this.element.nativeElement.style.display = 'flex';
    this.element.nativeElement.style.justifyContent = 'center';
    this.element.nativeElement.style.alignItems = 'center';

    element.style.width = 'inherit';
    element.style.maxWidth = 'inherit';

    element.style.height = 'inherit';
    element.style.maxHeight = 'inherit';
  }

  private onImgError(element: any, img: HTMLImageElement): void {
    this.renderer.removeChild(element, img);

    let svg = document.createRange().createContextualFragment(this.imgService.defaultSvg);

    this.renderer.appendChild(element, svg);

    setTimeout(() => {
      this.renderer.setAttribute(element.firstChild, 'aria-label', 'A broken or missing image');
    });
  }

  private copyNgContentAttribute(hostElem: any, icon: SVGElement | HTMLImageElement) {
    const attributes = hostElem.attributes as NamedNodeMap;

    for (let i = 0; i < attributes.length; i += 1) {
      const attribute = attributes.item(i);
  
      if (attribute && attribute.name.startsWith('_ngcontent')) {
        this.setNgContentAttribute(icon, attribute.name);
        break;
      }
    }
  }

  private setNgContentAttribute(parent: Node, attributeName: string) {
    this.renderer.setAttribute(parent, attributeName, '');

    for (let i = 0; i < parent.childNodes.length; i += 1) {
      const child = parent.childNodes[i];

      if (child instanceof Element) {
        this.setNgContentAttribute(child, attributeName);
      }
    }
  }

}
