import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { catchError, filter, firstValueFrom, of, Subscription, take, timeout } from 'rxjs';
import { CocktailTransitionRequest, CocktailTransitionService } from 'src/app/shared/service/transition/cocktail-transition.service';

@Component({
  selector: 'app-cocktail-transition',
  templateUrl: './cocktail-transition.component.html',
  styleUrls: ['./cocktail-transition.component.css']
})
export class CocktailTransitionComponent implements OnInit, OnDestroy{
  
  @ViewChild('overlay') overlay?: ElementRef<HTMLDivElement>
  @ViewChild('backdrop') backdrop?: ElementRef<HTMLDivElement>
  @ViewChild('transitionImage') transitionImage?: ElementRef<HTMLImageElement>

  transition: CocktailTransitionRequest | null = null
  private subscription?:Subscription
  private running = false
  private previousBodyOverflow = ''

  constructor(private router:Router, private transitionService:CocktailTransitionService, private changeDetector: ChangeDetectorRef){}

  ngOnInit(): void {

    this.subscription = this.transitionService.transition$.subscribe(request => {

      if (this.running){
        return
      }

      this.transition = request
      this.running = true

      this.lockScroll()

      this.changeDetector.detectChanges()

      requestAnimationFrame(() => {
        this.runTransition(request)
      })
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
    this.unlockScroll()
  }

  private async runTransition(request: CocktailTransitionRequest): Promise<void> {
    try{
      const cocktailId = request.cocktail.idDrink

      const detailReadyPromise = this.waitForDetailReady(cocktailId)

      let resolveNavigation: (value: boolean) => void

      const navigationPromise = new Promise<boolean>(resolve => {
        resolveNavigation = resolve
      })

      await this.animateToFullscreen(request, () => {

        this.router.navigate([`/cocktail/${cocktailId}`]).then(result => {
          resolveNavigation(result)
        })
      })

      const navigationSuccess = await navigationPromise

      if(!navigationSuccess){
        await this.hideOverlay()

        this.finishTransition()
        return
      }

      await detailReadyPromise
      await this.nextFrame()
      await this.hideOverlay()

      this.finishTransition()
    }
    catch (error){
      console.error(error)

      await this.hideOverlay()
      this.finishTransition()
    }
  }

  private animateToFullscreen(request: CocktailTransitionRequest, onNavigate: () => void): Promise<void> {
    return new Promise(resolve => {
      
      const image = this.transitionImage?.nativeElement
      const backdrop = this.backdrop?.nativeElement

      if(!image || !backdrop){
        resolve()
        return
      }

      const rect = request.imageRect
      /*const viewportWidth = window.innerWidth
      const viewpoerHeight = window.innerHeight

      const centerSize = Math.min(viewportWidth * 0.42, viewpoerHeight * 0.58, 520)

      const centerLeft = (viewportWidth - centerSize) / 2
      const centerTop = (viewportWidth - centerSize) / 2*/

      gsap.set(image, {
        left: rect.left,
        top:rect.top,

        width: rect.width,
        height: rect.height,

        borderRadius: 14,
        opacity: 1,
        scale: 1,
        filter:'blur(0px) brightness(1)'
      })

      gsap.set(backdrop, { opacity: 0 })

      const timeline = gsap.timeline({
        onComplete: () => resolve()
      })

      timeline.to(backdrop, {
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out'
      }, 0)

      /*timeline.to(image,{
        left: centerLeft,
        top:centerTop,
        width: centerSize,
        height:centerSize,

        borderRadius:28,
        duration:0.48,
        ease: 'power3.inOut'
      }, 0)*/

      timeline.to(image, {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,

        borderRadius:0,
        scale:1.08,
        filter: 'blur(7px) brightness(0.58)',
        duration: 0.85,
        ease: 'power3.inOut'
      }, 0)

      timeline.call( () => onNavigate(), [], 0.38 )
    })
  }

  private waitForDetailReady(cocktailId: string): Promise<string> {
    return firstValueFrom(
      this.transitionService.detailReady$.pipe(
        filter(id => id === cocktailId),
        take(1),
        
        timeout(1500),
        catchError(() => of(cocktailId))
      )
    )
  }

  private hideOverlay(): Promise<void> {
    return new Promise(resolve => {

      const overlay = this.overlay?.nativeElement

      if(!overlay){
        resolve()
        return
      }

      gsap.to(overlay, {
        opacity: 0,
        duration:0.38,
        ease:'power2.out',

        onComplete: () => resolve()
      }) 
    })
  }

  private nextFrame(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve()
        })
      })
    })
  }

  private lockScroll(): void {
    this.previousBodyOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
  }

  private unlockScroll(): void {
    document.body.style.overflow = this.previousBodyOverflow
  }

  private finishTransition(): void {

    const overlay = this.overlay?.nativeElement
    const transitionImage = this.transitionImage?.nativeElement
    const backdrop = this.backdrop?.nativeElement

    if(overlay) gsap.killTweensOf(overlay)
    if(transitionImage) gsap.killTweensOf(transitionImage)
    if(backdrop) gsap.killTweensOf(backdrop)

    this.transition = null
    this.running = false
    this.unlockScroll()
    this.changeDetector.detectChanges()
  }

}
