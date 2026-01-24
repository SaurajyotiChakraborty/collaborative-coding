'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, User, Code2, Settings } from 'lucide-react';
import type { UserProfile } from '@/types/extended-types';
import { EDITOR_THEMES } from '@/lib/constants';

interface ProfileCustomizationProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export function ProfileCustomization({ profile, onUpdateProfile }: ProfileCustomizationProps): JSX.Element {
  const [bio, setBio] = useState<string>(profile.bio);
  const [githubLink, setGithubLink] = useState<string>(profile.socialLinks.github || '');
  const [twitterLink, setTwitterLink] = useState<string>(profile.socialLinks.twitter || '');
  const [linkedinLink, setLinkedinLink] = useState<string>(profile.socialLinks.linkedin || '');
  const [websiteLink, setWebsiteLink] = useState<string>(profile.socialLinks.website || '');

  const handleSaveProfile = (): void => {
    onUpdateProfile({
      bio,
      socialLinks: {
        github: githubLink,
        twitter: twitterLink,
        linkedin: linkedinLink,
        website: websiteLink,
      },
    });
  };

  const handleThemeChange = (themeName: string): void => {
    const theme = EDITOR_THEMES.find(t => t.name === themeName);
    if (theme) {
      onUpdateProfile({ customTheme: theme });
    }
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: string | number | boolean): void => {
    onUpdateProfile({
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    });
  };

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text text-2xl">Profile Customization</CardTitle>
        </div>
        <CardDescription>Personalize your coding experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={200}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/200 characters</p>
              </div>

              <div className="space-y-3">
                <Label>Social Links</Label>
                <div className="grid gap-3">
                  <div>
                    <Input
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      placeholder="GitHub username"
                      prefix="github.com/"
                    />
                  </div>
                  <div>
                    <Input
                      value={twitterLink}
                      onChange={(e) => setTwitterLink(e.target.value)}
                      placeholder="Twitter handle"
                      prefix="twitter.com/"
                    />
                  </div>
                  <div>
                    <Input
                      value={linkedinLink}
                      onChange={(e) => setLinkedinLink(e.target.value)}
                      placeholder="LinkedIn profile"
                      prefix="linkedin.com/in/"
                    />
                  </div>
                  <div>
                    <Input
                      value={websiteLink}
                      onChange={(e) => setWebsiteLink(e.target.value)}
                      placeholder="Personal website URL"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                Save Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Editor Theme</Label>
                <Select
                  value={profile.customTheme.name}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITOR_THEMES.map(theme => (
                      <SelectItem key={theme.name} value={theme.name}>
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-4 border-purple-200/50 dark:border-purple-800/50">
                <p className="text-xs text-muted-foreground mb-2">Theme Preview</p>
                <div
                  className="p-4 rounded-lg font-mono text-sm"
                  style={{
                    backgroundColor: profile.customTheme.background,
                    color: profile.customTheme.foreground,
                  }}
                >
                  <div>
                    <span style={{ color: profile.customTheme.syntax.keyword }}>function</span>{' '}
                    <span style={{ color: profile.customTheme.syntax.function }}>hello</span>() &#123;
                  </div>
                  <div className="ml-4">
                    <span style={{ color: profile.customTheme.syntax.keyword }}>const</span> message ={' '}
                    <span style={{ color: profile.customTheme.syntax.string }}>&quot;Hello World&quot;</span>;
                  </div>
                  <div className="ml-4">
                    <span style={{ color: profile.customTheme.syntax.keyword }}>return</span>{' '}
                    <span style={{ color: profile.customTheme.syntax.number }}>42</span>;
                  </div>
                  <div>&#125;</div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select
                    value={profile.preferences.fontSize.toString()}
                    onValueChange={(val) => handlePreferenceChange('fontSize', parseInt(val))}
                  >
                    <SelectTrigger id="fontSize" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[12, 14, 16, 18, 20].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tabSize">Tab Size</Label>
                  <Select
                    value={profile.preferences.tabSize.toString()}
                    onValueChange={(val) => handlePreferenceChange('tabSize', parseInt(val))}
                  >
                    <SelectTrigger id="tabSize" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 8].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} spaces
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="keyBindings">Key Bindings</Label>
                  <Select
                    value={profile.preferences.keyBindings}
                    onValueChange={(val) => handlePreferenceChange('keyBindings', val)}
                  >
                    <SelectTrigger id="keyBindings" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="vim">Vim</SelectItem>
                      <SelectItem value="emacs">Emacs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.preferences.language}
                    onValueChange={(val) => handlePreferenceChange('language', val)}
                  >
                    <SelectTrigger id="language" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div>
                    <Label className="font-medium">Auto Complete</Label>
                    <p className="text-xs text-muted-foreground">Enable code completion suggestions</p>
                  </div>
                  <Button
                    variant={profile.preferences.autoComplete ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreferenceChange('autoComplete', !profile.preferences.autoComplete)}
                    className={profile.preferences.autoComplete ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                  >
                    {profile.preferences.autoComplete ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div>
                    <Label className="font-medium">Linting</Label>
                    <p className="text-xs text-muted-foreground">Show code quality warnings</p>
                  </div>
                  <Button
                    variant={profile.preferences.linting ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreferenceChange('linting', !profile.preferences.linting)}
                    className={profile.preferences.linting ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                  >
                    {profile.preferences.linting ? 'ON' : 'OFF'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div>
                    <Label className="font-medium">Minimap</Label>
                    <p className="text-xs text-muted-foreground">Show code minimap</p>
                  </div>
                  <Button
                    variant={profile.preferences.minimap ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePreferenceChange('minimap', !profile.preferences.minimap)}
                    className={profile.preferences.minimap ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                  >
                    {profile.preferences.minimap ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
